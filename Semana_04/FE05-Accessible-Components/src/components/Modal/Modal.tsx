import { useEffect, useRef, useState } from 'react'

function Modal() {
  const [isOpen, setIsOpen] = useState(false)

  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      openButtonRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <section>
      <h2>Componente Modal</h2>

      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Abrir Modal
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h3 id="modal-title">Modal Aberto</h3>

          <p>
            Este é o conteúdo da modal.
          </p>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
          >
            Fechar
          </button>
        </div>
      )}
    </section>
  )
}

export default Modal