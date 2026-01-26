import type { ComponentProps } from 'react'

type FormProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  onSubmit: () => void
}

export function Form({ onSubmit, children, ...props }: FormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSubmit()
      }}
      {...props}
    >
      {children}
    </form>
  )
}
