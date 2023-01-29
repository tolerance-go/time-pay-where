import './globals.css'

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang='zh-CN' className='dark'>
         <head />
         <body>{children}</body>
      </html>
   )
}
