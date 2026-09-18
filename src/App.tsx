import './App.css'
import { useState } from 'react'
import { Send, Loader2, RotateCw } from "lucide-react";

function App() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant", text: string, failed?: boolean }[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<'French' | 'Spanish' | 'Japanese'>('French');
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessages(prev => [...prev, { role: "user", text: inputText }])
    try {
      const response = await fetch('http://localhost:3000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          language: selectedLanguage
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      setMessages(prev => [...prev, { role: "assistant", text: data.translation }])
    } catch (error) {
      console.error('Error during translation:', error)
      setMessages(prev => prev.map((msg, index) => {
        if (index === prev.length - 1) {
          return { ...msg, failed: true };
        }
        return msg;
      }));
    } finally {
      setInputText("")
      setStatus('idle')
    }
  }

  const handleRetry = async (index: number) => {
    const failedMessage = messages[index];
    if (failedMessage && failedMessage.failed) {
      setStatus('loading');
      setRetryingIndex(index)
      try {
        const response = await fetch('http://localhost:3000/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: failedMessage.text,
            language: selectedLanguage
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        setMessages(prev => [...prev.map((msg, msgIndex) =>
          msgIndex === index ? { ...msg, failed: false } : msg
        ),
        { role: "assistant", text: data.translation }
        ]);
      } catch (error) {
        console.error('Error during translation:', error);
        setMessages(prev => prev.map((msg, msgIndex) => {
          if (msgIndex === index) {
            return { ...msg, failed: true };
          }
          return msg;
        }));
      } finally {
        setInputText("")
        setStatus('idle');
        setRetryingIndex(null);
      }
    }
  }

  return (
    <div className="app-container">
      {/* header/logo — always visible */}
      <div className='header bg-slate-900 flex items-center justify-center p-4'>
        <div>
          <img src="src/assets/pollyglot.png" alt="Pollyglot Logo" />
        </div>
        <div>
          <h1 className='text-[#65DA65] font-bold text-4xl'>PollyGlot</h1>
          <h3 className='text-white'>Perfect Translation every time</h3>
        </div>
      </div>

      <div className='flex flex-col gap-7 m-4 p-4 rounded-xl border-[#252F42] border-4'>
        {messages.map((msg, index) => (
          <div key={index}>
            <div className={`px-4 py-6  rounded-br-xl rounded-bl-xl  text-xl font-bold ${msg.role === "user" ? "bg-[#035A9D] text-white rounded-tl-xl " : "bg-[#65DA65]  rounded-tr-xl"}`}>
              {msg.text}
            </div>
            {msg.failed && (
              <button
                onClick={() => handleRetry(index)}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                {status === "loading" && retryingIndex === index ? (
                  <Loader2 className="text-green-500 animate-spin" size={24} />
                ) : (
                  <RotateCw size={14} />
                )}
                {status === "loading" && retryingIndex === index ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>
        ))}

        <div>
          <form onSubmit={handleSubmit}>
            <div className='relative'>
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={status === "loading"} className="w-full bg-[#F5F5F5] border-2 border-[#586E88] rounded-lg p-2 pr-12 resize-none" />
              <button
                type="submit"
                disabled={status === "loading"}
                className="absolute bottom-4 right-4"
              >
                {status === "loading" && retryingIndex === null ? (
                  <Loader2 className="text-green-500 animate-spin" size={24} />
                ) : (
                  <Send className="text-green-500" size={24} />
                )}
              </button>
            </div>
            <div className='flex justify-center gap-4 mt-4'>
              <button
                type="button"
                onClick={() => setSelectedLanguage('French')}
                className={`rounded border-2 flex items-center justify-center p-1 ${selectedLanguage === 'French' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <span className="fi fi-fr text-4xl"></span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('Spanish')}
                className={`rounded border-2 flex items-center justify-center p-1 ${selectedLanguage === 'Spanish' ? 'border-blue-500' : 'border-transparent'}`}
              >
                <span className="fi fi-es text-4xl"></span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('Japanese')}
                className={`border-2 flex items-center justify-center p-1 ${selectedLanguage === 'Japanese' ? 'border-blue-500' : 'border-gray-500'}`}
              >
                <span className="fi fi-jp text-4xl"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


export default App
