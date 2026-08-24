import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SEO, { articleSchema, breadcrumbSchema } from '../components/SEO'

export default function BlogPost() {
  const ref = useRef(null)
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (ref.current) ref.current.classList.add('page-enter')
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single()
      .then(({ data }) => {
        if (!data) setNotFound(true)
        else setPost(data)
        setLoading(false)
      })
  }, [slug])

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return <div className="blog-post-loading">Loading...</div>
  if (notFound) return (
    <div className="blog-post-notfound">
      <p>Article not found.</p>
      <Link to="/blog">← Back to articles</Link>
    </div>
  )

  return (
    <div ref={ref} className="blog-post-page" style={{ overflowX: 'hidden', paddingTop: '90px' }}>
      <SEO
        title={post.title}
        description={post.excerpt || post.title + ' — Usha Multi Speciality Dental Clinic, Sitamarhi.'}
        path={`/blog/${post.slug}`}
        image={post.cover_image}
        keywords={`${post.title}, dentist Sitamarhi, dental clinic Sitamarhi, ${post.category || ''}`}
        jsonLd={[
          articleSchema(post),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="blog-post-inner">
        <Link to="/blog" className="blog-post-back">← All Articles</Link>
        {post.cover_image && (
          <div className="blog-post-cover"><img src={post.cover_image} alt={post.title} /></div>
        )}
        <header className="blog-post-header">
          <p className="blog-post-date">{fmt(post.published_at)}</p>
          <h1>{post.title}</h1>
          <p className="blog-post-author">By {post.author}</p>
        </header>
        <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  )
}
