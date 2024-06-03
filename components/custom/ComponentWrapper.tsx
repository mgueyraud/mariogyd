export default function ComponentWrapper({ children }: {children: React.ReactElement}) {
  return (
    <div className="border border-stone-800 p-5 rounded-md bg-stone-950 aspect-square flex justify-center items-center my-6">
        {children}
    </div>
  )
}