

export function Input({onChange, placeholder, reference}: {placeholder: string; reference: any;onChange: () => void}) {
  return <div >
      <input ref={reference} type={'text'} placeholder={placeholder} className='px-4 py-2 rounded-lg border border-slate-300 m-2' onChange={onChange}/>
  </div>
}