import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For instant booking
instant_creation = """
    // Payment Policy Calculation
    let advanceAmount = 0;
    let remainingAmount = service.price;
    if (salon.paymentPolicy && salon.paymentPolicy.advanceRequired) {
      advanceAmount = Math.round((salon.paymentPolicy.advancePercentage / 100) * service.price);
      remainingAmount = service.price - advanceAmount;
    }

    const appointment = await Appointment.create([{
      customer: req.user._id,
      salon: salon._id,
      barber: assignedBarber,
      chair: assignedChair,
      serviceId: service._id,
      service: {
        name: service.name,
        price: service.price,
        duration: service.duration
      },
      price: service.price,
      advanceAmount,
      remainingAmount,
      paymentStatus: 'pending',
"""

content = re.sub(
    r"const appointment = await Appointment\.create\(\[\{\s*customer: req\.user\._id,\s*salon: salon\._id,\s*barber: assignedBarber,\s*chair: assignedChair,\s*serviceId: service\._id,\s*service: \{\s*name: service\.name,\s*price: service\.price,\s*duration: service\.duration\s*\},\s*price: service\.price,",
    instant_creation,
    content
)

# For scheduled booking
scheduled_creation = """
    // Payment Policy Calculation
    let advanceAmount = 0;
    let remainingAmount = service.price;
    if (salon.paymentPolicy && salon.paymentPolicy.advanceRequired) {
      advanceAmount = Math.round((salon.paymentPolicy.advancePercentage / 100) * service.price);
      remainingAmount = service.price - advanceAmount;
    }

    const appointment = await Appointment.create([{
      customer: req.user._id,
      salon: salon._id,
      barber: selectedBarberId || assignedBarber,
      chair: assignedChair,
      serviceId: service._id,
      service: {
        name: service.name,
        price: service.price,
        duration: service.duration
      },
      price: service.price,
      advanceAmount,
      remainingAmount,
      paymentStatus: 'pending',
"""

content = re.sub(
    r"const appointment = await Appointment\.create\(\[\{\s*customer: req\.user\._id,\s*salon: salon\._id,\s*barber: selectedBarberId \|\| assignedBarber,\s*chair: assignedChair,\s*serviceId: service\._id,\s*service: \{\s*name: service\.name,\s*price: service\.price,\s*duration: service\.duration\s*\},\s*price: service\.price,",
    scheduled_creation,
    content
)

# NOTE: If payment is required, we don't emit booking confirmed yet!
# We must intercept the event emission in appointmentController if payment is pending.

emit_replacer = """
    if (useTransaction) await session.commitTransaction();

    if (advanceAmount === 0) {
      emitBookingConfirmed(appointment[0], salon);
    }
"""

content = re.sub(
    r"if \(useTransaction\) await session\.commitTransaction\(\);\s*emitBookingConfirmed\(appointment\[0\], salon\);",
    emit_replacer,
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController.js to support advance payments")
