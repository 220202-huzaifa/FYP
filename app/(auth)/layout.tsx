import type { Metadata } from 'next'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className=" flex justify-center items-center min-h-screen">
      {children}
    </div>
  )
}
