type BetaniaLogoProps = {
  className?: string
}

export function BetaniaLogo({ className }: BetaniaLogoProps) {
  return (
    <svg
      viewBox="0 0 51 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Betania"
    >
      <path
        d="M15 0C23.2843 0 30 6.71573 30 15V21C13.4315 21 1.04634e-06 34.4315 0 51V15C0 6.71573 6.71573 1.03081e-06 15 0Z"
        fill="currentColor"
      />
      <path
        d="M36 21C44.2843 21 51 27.7157 51 36C51 44.2843 44.2843 51 36 51H0C16.5685 51 30 37.5685 30 21H36Z"
        fill="#5EEAD4"
      />
      <circle cx="38" cy="13" r="5" fill="#5EEAD4" />
    </svg>
  )
}
