export type FormValues = {
  type: string;
  title?: string;
  timeLen: number;
};

export type TomatoList = {
  timeLen: number;
  title?: string;
  type: string;
  createTime: number;
  uid: string;
}[];
