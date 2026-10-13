import { useState } from 'react'

function Disclosure() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section>
      <h2>Componente Disclosure</h2>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="disclosure-panel"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Ocultar conteúdo' : 'Mostrar conteúdo'}
      </button>

      {isOpen && (
        <div id="disclosure-panel">
          <p>
            Este é o conteúdo do disclosure.
          </p>
        </div>
      )}
    </section>
  )
}

export default Disclosure