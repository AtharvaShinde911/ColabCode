import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import { Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom"
import * as y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="h-screen w-full bg-black flex items-center justify-center p-5">
      <section className="w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900 p-10 text-center text-white shadow-xl">
        <h1 className="text-5xl font-bold tracking-[0.25em] text-white">MIRROR</h1>
        <p className="mt-4 text-neutral-300">
          Real-time collaborative coding. Write together, instantly.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-8 rounded-lg bg-white px-6 py-3 text-sm font-bold text-gray-950 transition hover:bg-neutral-200"
        >
          Login
        </button>
      </section>
    </main>
  )
}

function LoginPage() {
  const navigate = useNavigate()

  const handleJoin = (e) => {
    e.preventDefault()
    const enteredUsername = e.target.username.value.trim()
    if (!enteredUsername) return
    navigate(`/main?username=${encodeURIComponent(enteredUsername)}`)
  }

  return (
    <main className="h-screen w-full bg-black flex items-center justify-center p-5">
      <form
        onSubmit={handleJoin}
        className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-8 text-white flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-white">Login to MIRROR</h2>
        <input
          name="username"
          type="text"
          placeholder="Enter your name"
          className="p-3 rounded-lg bg-neutral-800 text-white outline-none border border-neutral-700 focus:border-white"
        />
        <button className="p-3 rounded-lg bg-white text-gray-950 font-bold">
          Join Editor
        </button>
      </form>
    </main>
  )
}

function MainEditorPage() {
  const editorRef = useRef(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [searchParams] = useSearchParams()
  const username = searchParams.get("username") || ""
  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    setIsEditorReady(true)
  }

  useEffect(() => {
    if (username && isEditorReady && editorRef.current) {

      const provider = new SocketIOProvider("/", "monaco", ydoc, {
        autoConnect: true,
      })

      provider.awareness.setLocalStateField("user", { username, status: "online" })

      const updateUsers = () => {
        const states = Array.from(provider.awareness.getStates().values())
        const uniqueUsers = new Map()

        states.forEach((state) => {
          if (state?.user?.username) {
            uniqueUsers.set(state.user.username, state.user)
          }
        })

        setUsers(Array.from(uniqueUsers.values()))
      }

      provider.awareness.on("change", updateUsers)
      updateUsers()

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)

      const monacoBinding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      )

      return () => {
        provider.awareness.off("change", updateUsers)
        monacoBinding.destroy()
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }

    }
  }, [isEditorReady, username, yText, ydoc])

  if (!username) {
    return <Navigate to="/login" replace />
  }
  return (
    <main className="h-screen w-full bg-black flex gap-4 p-5">
      <div className="h-full w-full flex gap-4">
        <aside className="h-full w-1/4 rounded-2xl border border-white bg-neutral-800 p-4 text-white">
          <h2 className="text-lg font-semibold mb-3">Online Users</h2>
          <div className="flex flex-col gap-2">
            {users.length === 0 ? (
              <p className="text-sm text-neutral-300">No users connected yet</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between bg-neutral-700/60 rounded-lg px-3 py-2"
                >
                  <span className="text-sm">
                    {user.username}
                    {user.username === username ? " (you)" : ""}
                  </span>
                  <span className="text-xs text-green-300">online</span>
                </div>
              ))
            )}
          </div>
        </aside>
        <section className="h-full w-3/4 rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <Editor
            height="100%"
            width="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            path="main.js"
            onMount={handleEditorMount}
          />
        </section>
      </div>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/main" element={<MainEditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App


