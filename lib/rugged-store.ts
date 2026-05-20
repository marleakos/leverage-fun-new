"use client"

const KEY = "lf:rugged"

function read(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

function write(data: Record<string, number>) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent("lf:rugged-change"))
}

export const ruggedStore = {
  get: read,
  isRugged(id: string) {
    return !!read()[id]
  },
  ids() {
    return Object.keys(read())
  },
  rug(id: string) {
    const data = read()
    if (data[id]) return
    data[id] = Date.now()
    write(data)
  },
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {}
    const handler = () => cb()
    window.addEventListener("lf:rugged-change", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("lf:rugged-change", handler)
      window.removeEventListener("storage", handler)
    }
  },
}

import { useEffect, useState } from "react"

export function useRugged() {
  const [data, setData] = useState<Record<string, number>>({})
  useEffect(() => {
    setData(ruggedStore.get())
    return ruggedStore.subscribe(() => setData(ruggedStore.get()))
  }, [])
  return data
}
