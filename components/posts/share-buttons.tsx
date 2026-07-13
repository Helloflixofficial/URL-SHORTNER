'use client'
import { useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

// Inline SVGs for social brands
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const FBIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const WAIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.559 1.875 14.09 .843 11.458.843c-5.437 0-9.862 4.421-9.866 9.865-.001 1.777.464 3.51 1.347 5.042l-1.009 3.682 3.77-.988c1.513.825 3.197 1.258 4.907 1.26zm9.213-6.666c-.272-.136-1.614-.797-1.864-.888-.25-.09-.432-.136-.613.136-.182.271-.704.888-.863 1.07-.159.18-.318.203-.59.067-.272-.136-1.15-.424-2.19-1.354-.809-.722-1.354-1.616-1.513-1.888-.159-.272-.017-.418.119-.553.123-.122.272-.318.408-.477.136-.16.182-.272.272-.453.09-.182.045-.34-.022-.477-.068-.136-.613-1.477-.84-2.023-.222-.536-.445-.463-.613-.472-.159-.009-.34-.01-.523-.01-.182 0-.477.068-.727.34-.25.272-.954.933-.954 2.273 0 1.341.977 2.637 1.114 2.818.136.182 1.92 2.932 4.654 4.113.65.28 1.157.447 1.554.574.653.208 1.248.178 1.717.108.523-.078 1.614-.66 1.841-1.296.227-.636.227-1.182.159-1.296-.068-.113-.25-.181-.523-.318z"/>
  </svg>
)
const RDIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-5.99-1.72l1.22-3.86 3.93.84c.04.84.74 1.5 1.59 1.5 1.65 0 3-1.35 3-3s-1.35-3-3-3c-.83 0-1.58.34-2.12.88l-4.42-.94c-.23-.05-.46.09-.53.3l-1.6 5.06c-2.31.08-4.48.73-6.17 1.74-.55-.74-1.44-1.21-2.43-1.21-1.65 0-3 1.35-3 3 0 1.09.58 2.04 1.46 2.56-.04.2-.06.4-.06.6 0 3.31 4.03 6 9 6s9-2.69 9-6c0-.2-.02-.4-.06-.6.88-.52 1.46-1.47 1.46-2.56zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5zm11.5 4.5c-1.48 1.48-4.29 1.48-5.77 0-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 1.09 1.09 3.27 1.09 4.36 0 .2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-.27-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
)
const LIIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

interface ShareButtonsProps {
  title: string
  url: string
}

const platforms = [
  {
    key: 'facebook',
    label: 'Share on Facebook',
    Icon: FBIcon,
    bgColor: 'bg-[#1877F2]',
    href: (u: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    key: 'twitter',
    label: 'Share on X / Twitter',
    Icon: XIcon,
    bgColor: 'bg-black',
    href: (u: string, t: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: 'whatsapp',
    label: 'Share on WhatsApp',
    Icon: WAIcon,
    bgColor: 'bg-[#25D366]',
    href: (u: string, t: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(t + ' ' + u)}`,
  },
  {
    key: 'reddit',
    label: 'Share on Reddit',
    Icon: RDIcon,
    bgColor: 'bg-[#FF4500]',
    href: (u: string, t: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    key: 'linkedin',
    label: 'Share on LinkedIn',
    Icon: LIIcon,
    bgColor: 'bg-[#0A66C2]',
    href: (u: string, t: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
]

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-bold text-[#757575] uppercase tracking-wider mr-2 font-sans">
        Share
      </span>
      {platforms.map(({ key, label, Icon, bgColor, href }) => (
        <a
          key={key}
          href={href(url, title)}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className={`w-8 h-8 rounded-[3px] flex items-center justify-center text-white ${bgColor} transition-all duration-200 hover:scale-110 hover:brightness-110 active:scale-95 shadow-sm`}
        >
          <Icon className="w-4 h-4 text-white" />
        </a>
      ))}
      <button
        onClick={copy}
        title="Copy page link"
        className="w-8 h-8 rounded-[3px] flex items-center justify-center text-white bg-[#7C3AED] transition-all duration-200 hover:scale-110 hover:brightness-110 active:scale-95 shadow-sm"
      >
        {copied ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4 text-white" />}
      </button>
    </div>
  )
}
