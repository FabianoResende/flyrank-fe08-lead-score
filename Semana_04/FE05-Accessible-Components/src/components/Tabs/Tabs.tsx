import { KeyboardEvent, useRef, useState } from 'react'

function Tabs() {
  const [activeTab, setActiveTab] = useState('tab1')

  const tab1Ref = useRef<HTMLButtonElement>(null)
  const tab2Ref = useRef<HTMLButtonElement>(null)
  const tab3Ref = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      if (activeTab === 'tab1') {
        setActiveTab('tab2')
        tab2Ref.current?.focus()
      } else if (activeTab === 'tab2') {
        setActiveTab('tab3')
        tab3Ref.current?.focus()
      } else {
        setActiveTab('tab1')
        tab1Ref.current?.focus()
      }
    }

    if (event.key === 'ArrowLeft') {
      if (activeTab === 'tab3') {
        setActiveTab('tab2')
        tab2Ref.current?.focus()
      } else if (activeTab === 'tab2') {
        setActiveTab('tab1')
        tab1Ref.current?.focus()
      } else {
        setActiveTab('tab3')
        tab3Ref.current?.focus()
      }
    }
  }

  return (
    <section>
      <h2>Componente Tabs</h2>

      <div role="tablist" aria-label="Exemplo de abas">
        <button
          ref={tab1Ref}
          role="tab"
          aria-selected={activeTab === 'tab1'}
          type="button"
          onClick={() => setActiveTab('tab1')}
          onKeyDown={handleKeyDown}
          style={{
            fontWeight: activeTab === 'tab1' ? 'bold' : 'normal'
          }}
        >
          Aba 1
        </button>

        <button
          ref={tab2Ref}
          role="tab"
          aria-selected={activeTab === 'tab2'}
          type="button"
          onClick={() => setActiveTab('tab2')}
          onKeyDown={handleKeyDown}
          style={{
            fontWeight: activeTab === 'tab2' ? 'bold' : 'normal'
          }}
        >
          Aba 2
        </button>

        <button
          ref={tab3Ref}
          role="tab"
          aria-selected={activeTab === 'tab3'}
          type="button"
          onClick={() => setActiveTab('tab3')}
          onKeyDown={handleKeyDown}
          style={{
            fontWeight: activeTab === 'tab3' ? 'bold' : 'normal'
          }}
        >
          Aba 3
        </button>
      </div>

      {activeTab === 'tab1' && (
        <div role="tabpanel">
          <p>Conteúdo da Aba 1</p>
        </div>
      )}

      {activeTab === 'tab2' && (
        <div role="tabpanel">
          <p>Conteúdo da Aba 2</p>
        </div>
      )}

      {activeTab === 'tab3' && (
        <div role="tabpanel">
          <p>Conteúdo da Aba 3</p>
        </div>
      )}
    </section>
  )
}

export default Tabs