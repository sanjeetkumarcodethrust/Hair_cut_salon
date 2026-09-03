import re

with open('backend/routes/paymentRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("confirmPayment,", "confirmPayment,\n  refundPayment,")
content = content.replace("export default router;", "router.post('/:id/refund', protect, refundPayment);\n\nexport default router;")

with open('backend/routes/paymentRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Mounted refundPayment in paymentRoutes.js")
