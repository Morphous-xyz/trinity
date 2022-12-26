import Link from 'next/link'
import styles from './Card.module.css'

interface CardProps {
  title: string
  caption: string
  href: string
}

const titleStyle = { fontSize: '20px', fontWeight: 700 }

const captionStyle = { fontSize: '14px' }

const Card: React.FC<CardProps> = ({ title, caption, href }) => {
  return (
    <Link className={styles.card} href={href}>
      <span style={titleStyle}>{title}</span>
      <span style={captionStyle}>{caption}</span>
    </Link>
  )
}

export default Card
