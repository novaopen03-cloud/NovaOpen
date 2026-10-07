// CTA provvisoria: sostituire "#" con il link di checkout (Stripe, PayPal, Shopify...)
document.getElementById('cta').addEventListener('click', function (e) {
  if (this.getAttribute('href') === '#') {
    e.preventDefault();
    alert('Checkout in arrivo! Collega qui il link di pagamento.');
  }
});
