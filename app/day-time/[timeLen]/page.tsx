"use client";

import { tomatoLocalKey } from "@/constants/local";
import { TomatoList } from "@/types/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import store from "store2";

export default function TimeLen({
  params,
}: {
  params: {
    timeLen: string;
  };
}) {
  const tl = Number(params.timeLen);
  const [tomatoList, setTomatoList] = useState<TomatoList>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tomatoList: TomatoList = store.get(tomatoLocalKey, []);
      const hitDateList = tomatoList.filter((item) =>
        dayjs(item.createTime).isSame(tl, "D")
      );
      console.log("hitDateList", hitDateList);
      setTomatoList(hitDateList);
    }
  }, []);

  return tomatoList.length ? (
    <iframe
      className="bg-black h-screen w-screen"
      srcDoc={`<body style="
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      ">
      <pre class="mermaid" style="
        width: 100%;
        color: black;
      ">
        pie title day-time ${dayjs(tl).format("YYYY-MM-DD")}
            ${tomatoList
              .map((item) => `"${item.type}" : ${item.timeLen}`)
              .join("\n")}
      </pre>
      <script type="module">
         import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs'
         mermaid.initialize({ startOnLoad: true, theme: 'dark' })
      </script>
   </body>`}
    ></iframe>
  ) : null;
}
