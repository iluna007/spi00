export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-100">
      <div className="w-full px-4 py-4">
        <p className="text-center text-sm text-neutral-500">
          © {currentYear} spi00
        </p>
      </div>
    </footer>
  )
}
