import { useEffect, useRef } from 'react'

let quillLoading = null
function loadQuill() {
  if (window.Quill) return Promise.resolve()
  if (quillLoading) return quillLoading
  quillLoading = new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js'
    script.onload = resolve
    document.head.appendChild(script)
  })
  return quillLoading
}

export default function RichEditor({ value, onChange, placeholder, onImageUpload }) {
  const containerRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const onImageUploadRef = useRef(onImageUpload)
  onChangeRef.current = onChange
  onImageUploadRef.current = onImageUpload

  useEffect(() => {
    let cancelled = false
    loadQuill().then(() => {
      if (cancelled || quillRef.current || !containerRef.current) return
      const Quill = window.Quill

      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Start writing...',
        modules: {
          toolbar: {
            container: [
              [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ script: 'sub' }, { script: 'super' }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ align: [] }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video'],
              ['clean'],
            ],
            handlers: {
              image: function () {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async () => {
                  const file = input.files[0]
                  if (!file || !onImageUploadRef.current) return
                  const range = this.quill.getSelection(true)
                  this.quill.insertText(range.index, 'Uploading image...', { italic: true })
                  const url = await onImageUploadRef.current(file)
                  this.quill.deleteText(range.index, 'Uploading image...'.length)
                  if (url) {
                    this.quill.insertEmbed(range.index, 'image', url)
                    this.quill.setSelection(range.index + 1)
                  }
                }
                input.click()
              },
            },
          },
        },
      })

      if (value) quillRef.current.root.innerHTML = value

      quillRef.current.on('text-change', () => {
        onChangeRef.current?.(quillRef.current.root.innerHTML)
      })
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const q = quillRef.current
    if (!q) return
    const current = q.root.innerHTML
    if (!q.hasFocus() && value !== undefined && value !== current) {
      q.root.innerHTML = value || ''
    }
  }, [value])

  return <div className="rich-editor"><div ref={containerRef} /></div>
}
