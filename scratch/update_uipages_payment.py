import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

instant_payment_logic = """
                             const res = await api.post('/appointments/instant', { shopId: id, serviceId: selectedServiceId });
                             const apt = res.data.data;
                             if (apt.paymentStatus === 'pending') {
                               const payRes = await api.post('/payments/create-checkout-session', { appointmentId: apt._id });
                               if (payRes.data.payment?.url) {
                                  window.location.href = payRes.data.payment.url;
                                  return;
                               }
                             }
                             setBookingSuccess(apt);
"""
content = re.sub(
    r"const res = await api\.post\('/appointments/instant', \{ shopId: id, serviceId: selectedServiceId \}\);\s*setBookingSuccess\(res\.data\.data\);",
    instant_payment_logic,
    content
)

scheduled_payment_logic = """
                               const res = await api.post('/appointments/scheduled', {
                                 shopId: id,
                                 serviceId: selectedServiceId,
                                 date: selectedDate,
                                 startTime: selectedSlot
                               });
                               const apt = res.data.data;
                               if (apt.paymentStatus === 'pending') {
                                 const payRes = await api.post('/payments/create-checkout-session', { appointmentId: apt._id });
                                 if (payRes.data.payment?.url) {
                                    window.location.href = payRes.data.payment.url;
                                    return;
                                 }
                               }
                               setBookingSuccess(apt);
"""
content = re.sub(
    r"const res = await api\.post\('/appointments/scheduled', \{\s*shopId: id,\s*serviceId: selectedServiceId,\s*date: selectedDate,\s*startTime: selectedSlot\s*\}\);\s*setBookingSuccess\(res\.data\.data\);",
    scheduled_payment_logic,
    content
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UiPages.jsx to auto-redirect to payment")
