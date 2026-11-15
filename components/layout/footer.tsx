import { FooterLinks } from './footer-part1'
import { FooterBottom } from './footer-part2'

export function Footer() {
  return (
    <footer className="bg-brand-950 pt-16">
      <div className="shell">
        <FooterLinks />
        <FooterBottom />
      </div>
    </footer>
  )
}
