import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Review check
get_appointment_logic = """
      // Ownership verification for customers
      if (req.user.role === 'customer') {
         if (appointment.customer?._id?.toString() !== req.user._id.toString() && appointment.customer?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to view this booking' });
         }
      } else if (req.user.role === 'owner') {
         if (appointment.salon?._id?.toString() !== req.user.salonId?.toString()) {
            return res.status(403).json({ message: 'You are not authorized to view this booking' });
         }
      }

      // Check if review exists for this appointment
      let isReviewed = false;
      const Review = (await import('../models/Review.js')).default;
      const reviewExists = await Review.exists({ appointment: appointment._id });
      if (reviewExists) {
        isReviewed = true;
      }

      const responseObj = appointment.toObject();
      responseObj.isReviewed = isReviewed;

      res.status(200).json(responseObj);
"""

content = re.sub(
    r"// Ownership verification for customers\s*if \(req\.user\.role === 'customer'\) \{\s*if \(appointment\.customer\?._id\?\.toString\(\) !== req\.user\._id\.toString\(\) && appointment\.customer\?\.toString\(\) !== req\.user\._id\.toString\(\)\) \{\s*return res\.status\(403\)\.json\(\{ message: 'You are not authorized to view this booking' \}\);\s*\}\s*\} else if \(req\.user\.role === 'owner'\) \{\s*if \(appointment\.salon\?._id\?\.toString\(\) !== req\.user\.salonId\?\.toString\(\)\) \{\s*return res\.status\(403\)\.json\(\{ message: 'You are not authorized to view this booking' \}\);\s*\}\s*\}\s*res\.status\(200\)\.json\(appointment\);",
    get_appointment_logic,
    content
)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added isReviewed flag to getAppointment")
