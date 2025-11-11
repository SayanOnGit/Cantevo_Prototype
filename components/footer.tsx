export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">Cantevo</h3>
            <p className="text-sm text-muted-foreground">Fast and fresh food ordering with real-time tracking</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/menu" className="hover:text-primary transition">
                  Browse Menu
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-primary transition">
                  Track Orders
                </a>
              </li>
              <li>
                <a href="/feedback" className="hover:text-primary transition">
                  Send Feedback
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-primary transition">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: support@cantevo.com</li>
              <li>Phone: +91-XXXX-XXXXX</li>
              <li>Hours: 8AM - 6PM IST</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 Cantevo - Online Canteen Automation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
