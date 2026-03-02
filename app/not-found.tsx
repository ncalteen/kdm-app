import { ReactElement } from 'react'

export default function Page(): ReactElement {
  return (
    <div className="grid grid-rows-[1fr] justify-items-center sm:p-8 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold pt-[20px]">Page Not Found</h1>

      <h1 className="text-2xl font-bold">
        The page you are looking for has been lost to the darkness...
      </h1>
    </div>
  )
}
