'use client'

import { Dialog, Transition } from '@headlessui/react'
import { ErrorMessage } from '@hookform/error-message'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { Fragment, useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import { useForm } from 'react-hook-form'
import store from 'store2'
import { uid } from 'uid'

import { Loading } from '@/components/Loading'
import {
   activedLocalKey,
   countingLocalKey,
   tomatoLocalKey,
   totalLocalKey,
} from '@/constants/local'
import { FormValues, TomatoList } from '@/types/core'
import Link from 'next/link'
import styles from './page.module.css'

const defaultTimeLen = 5

export default function Home() {
   const countdownRef = useRef<Countdown>(null)
   const [pause, setPause] = useState(false)
   const [counting, setCounting] = useState<boolean>()
   const [actived, setActived] = useState<FormValues>()
   let [isOpen, setIsOpen] = useState(false)
   const [tomatoList, setTomatoList] = useState<TomatoList>()
   const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
   } = useForm<FormValues>({
      criteriaMode: 'all',
      defaultValues: {
         title: 'chore',
         timeLen: defaultTimeLen,
      },
   })

   function closeModal() {
      setIsOpen(false)
   }

   function openModal() {
      setIsOpen(true)
   }
   const onSubmit = (data: FormValues) => {
      store.set(totalLocalKey, data.timeLen * 60 * 1000)
      setCounting(true)
      store.set(countingLocalKey, true)
      setActived(data)
      store.set(activedLocalKey, data)
      closeModal()
      reset()
   }

   useEffect(() => {
      setTomatoList(
         ((): TomatoList => {
            if (typeof window !== 'undefined') {
               return store.get(tomatoLocalKey, [])
            }
            return []
         })(),
      )
      setActived(
         ((): FormValues | undefined => {
            if (typeof window !== 'undefined') {
               return store.get(activedLocalKey, undefined)
            }
            return undefined
         })(),
      )
      setCounting(
         ((): boolean => {
            if (typeof window !== 'undefined') {
               return store.get(countingLocalKey, false)
            }
            return false
         })(),
      )
   }, [])

   const date = store.get(totalLocalKey, undefined)
      ? Date.now() + store.get(totalLocalKey, undefined)
      : Date.now() + (actived?.timeLen ?? 0) * 1000 * 60

   const audioWithDingRef = useRef<HTMLAudioElement>(null)

   return (
      <main>
         <audio
            ref={audioWithDingRef}
            className='hidden'
            controls
            src='/_assets/ding.mp3'
         ></audio>
         <div className='mx-auto max-w-screen-sm'>
            <div className='text-white text-lg flex justify-end p-4'>
               <Link
                  href={'https://github.com/tolerance-go/time-pay-where'}
                  target='_blank'
                  className='hover:underline underline-offset-2'
               >
                  <svg
                     viewBox='64 64 896 896'
                     focusable='false'
                     data-icon='github'
                     width='1em'
                     height='1em'
                     fill='currentColor'
                     aria-hidden='true'
                  >
                     <path d='M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z' />
                  </svg>
               </Link>
            </div>
            <div className='p-10'>
               <div className='flex justify-center items-center'>
                  {counting ? (
                     <div className='flex space-x-5'>
                        <div
                           className={clsx(
                              styles.thirteen,
                              styles.btn,
                              'after:bg-[#0f0f0f] text-white',
                           )}
                        >
                           <Countdown
                              ref={countdownRef}
                              date={date}
                              onComplete={() => {
                                 store.set(totalLocalKey, undefined)
                                 setActived(undefined)
                                 store.set(activedLocalKey, undefined)
                                 setTomatoList((prev) => {
                                    if (actived) {
                                       const next = (prev ?? []).concat({
                                          ...actived,
                                          createTime: new Date().getTime(),
                                          uid: uid(),
                                       })
                                       store.set(tomatoLocalKey, next)
                                       return next
                                    }
                                    return prev
                                 })
                                 setCounting(false)
                                 store.set(countingLocalKey, false)
                                 audioWithDingRef.current?.play()
                              }}
                              onTick={(data) => {
                                 store.set(totalLocalKey, data.total)
                              }}
                           />
                        </div>
                        <button
                           className='text-gray-400 hover:text-white transition'
                           onClick={() => {
                              if (pause) {
                                 countdownRef.current?.api?.start()
                              } else {
                                 countdownRef.current?.api?.pause()
                              }
                              setPause(!pause)
                           }}
                        >
                           {pause ? '开始 🎬' : '暂停 ⏸'}
                        </button>
                        <button
                           className='text-gray-400 hover:text-white transition'
                           onClick={() => {
                              store.set(totalLocalKey, undefined)
                              setActived(undefined)
                              store.set(activedLocalKey, undefined)
                              setCounting(false)
                              store.set(countingLocalKey, false)
                           }}
                        >
                           放弃 🌚
                        </button>
                     </div>
                  ) : (
                     <button
                        className={clsx(
                           styles.btn,
                           'text-base font-medium text-center text-white transition ease-in-out transform bg-sky-600 rounded-xl hover:bg-sky-700 focus:outline-none active:scale-95 duration-100',
                        )}
                        onClick={openModal}
                     >
                        {counting === undefined ? <Loading /> : '种番茄'}
                     </button>
                  )}
               </div>
            </div>

            <div
               className={clsx(
                  'bg-[#131313] rounded-xl px-5 py-2.5 flex flex-col mx-4 sm:mx-0',
                  counting && !pause && 'opacity-70 pointer-events-none',
               )}
            >
               {tomatoList ? (
                  tomatoList.length ? (
                     tomatoList
                        .sort((a, b) => b.createTime - a.createTime)
                        .map((item, index) => (
                           <Link
                              href={`/day-time/${item.createTime}`}
                              key={item.uid}
                              target='_blank'
                              className='flex group justify-between py-4 border-b border-b-gray-800 last:border-b-transparent'
                           >
                              <div className='flex-grow flex justify-between'>
                                 <div className=' flex space-x-4 items-center'>
                                    <div className='rounded-full bg-[#2e2e2e] p-1 text-sky-400 text-xs w-5 h-5 flex items-center justify-center'>
                                       {index + 1}
                                    </div>
                                    <h2 className='text-gray-100 text-lg font-bold'>
                                       {item.title || 'chore'}
                                    </h2>
                                    <div className='space-x-1.5'>
                                       {Array(Math.floor(item.timeLen / 15))
                                          .fill(null)
                                          .map((_, index) => (
                                             <span key={index}>🍅</span>
                                          ))}
                                    </div>
                                 </div>
                              </div>
                              <div>
                                 <span className='text-sky-400 text-sm font-light uppercase mr-3'>
                                    {item.type}
                                 </span>
                                 <span className='text-gray-400 text-sm group-hover:underline group-hover:text-white underline-offset-4 decoration-sky-400'>
                                    {dayjs(item.createTime).format(
                                       'DD/MM/YYYY',
                                    )}
                                 </span>
                              </div>
                           </Link>
                        ))
                  ) : (
                     <div className='flex justify-center text-white py-4'>
                        暂无记录
                     </div>
                  )
               ) : (
                  <div className='flex justify-center'>
                     <Loading />
                  </div>
               )}
            </div>
         </div>

         <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' className='relative z-10' onClose={closeModal}>
               <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
               >
                  <div className='fixed inset-0 bg-black bg-opacity-25' />
               </Transition.Child>

               <div className='fixed inset-0 overflow-y-auto'>
                  <div className='flex min-h-full items-center justify-center p-4 text-center'>
                     <Transition.Child
                        as={Fragment}
                        enter='ease-out duration-300'
                        enterFrom='opacity-0 scale-95'
                        enterTo='opacity-100 scale-100'
                        leave='ease-in duration-200'
                        leaveFrom='opacity-100 scale-100'
                        leaveTo='opacity-0 scale-95'
                     >
                        <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                           <form onSubmit={handleSubmit(onSubmit)}>
                              <Dialog.Title
                                 as='h3'
                                 className='text-lg font-medium leading-6 text-gray-900'
                              >
                                 准备种番茄了 💪🏻
                              </Dialog.Title>
                              <div className='mt-4 space-y-6'>
                                 <div>
                                    <label
                                       htmlFor='type'
                                       className='block text-sm font-medium text-neutral-600'
                                    >
                                       时长（单位：分钟）
                                    </label>
                                    <div className='mt-2'>
                                       <input
                                          id='timeLen'
                                          type={'number'}
                                          step={defaultTimeLen}
                                          {...register('timeLen', {
                                             required: '时长必填喔',
                                             max: {
                                                value: 50,
                                                message:
                                                   '时长建议不超过 1h 呢😅',
                                             },
                                          })}
                                          placeholder='这次准备专注多久呢'
                                          className='block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300'
                                       />
                                       <ErrorMessage
                                          errors={errors}
                                          name='timeLen'
                                          render={({ messages }) => {
                                             return (
                                                messages &&
                                                Object.entries(messages).map(
                                                   ([type, message]) => (
                                                      <p
                                                         key={type}
                                                         className='text-red-600 bg-red-50 py-2 px-3 rounded-md'
                                                      >
                                                         {message}
                                                      </p>
                                                   ),
                                                )
                                             )
                                          }}
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label
                                       htmlFor='type'
                                       className='block text-sm font-medium text-neutral-600'
                                    >
                                       标签
                                    </label>
                                    <div className='mt-2'>
                                       <input
                                          id='type'
                                          {...register('type', {
                                             required: '类型必填喔',
                                             maxLength: {
                                                value: 20,
                                                message:
                                                   '类型最大长度为 20 个字符😅',
                                             },
                                          })}
                                          placeholder='给番茄分个类'
                                          className='block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300'
                                       />
                                       <ErrorMessage
                                          errors={errors}
                                          name='type'
                                          render={({ messages }) => {
                                             return (
                                                messages &&
                                                Object.entries(messages).map(
                                                   ([type, message]) => (
                                                      <p
                                                         key={type}
                                                         className='text-red-600 bg-red-50 py-2 px-3 rounded-md'
                                                      >
                                                         {message}
                                                      </p>
                                                   ),
                                                )
                                             )
                                          }}
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label
                                       htmlFor='title'
                                       className='block text-sm font-medium text-neutral-600'
                                    >
                                       标题（可选）
                                    </label>
                                    <div className='mt-2'>
                                       <input
                                          id='title'
                                          {...register('title')}
                                          placeholder='给番茄取个名字'
                                          className='block w-full px-5 py-3 text-base text-neutral-600 placeholder-gray-300 transition duration-500 ease-in-out transform border border-transparent rounded-lg bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300'
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div className='mt-4 space-x-2 justify-end flex'>
                                 <button
                                    type='button'
                                    className='inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
                                    onClick={closeModal}
                                 >
                                    取消
                                 </button>
                                 <button
                                    type='submit'
                                    className='inline-flex justify-center rounded-md border border-transparent bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
                                 >
                                    种它！
                                 </button>
                              </div>
                           </form>
                        </Dialog.Panel>
                     </Transition.Child>
                  </div>
               </div>
            </Dialog>
         </Transition>
      </main>
   )
}
