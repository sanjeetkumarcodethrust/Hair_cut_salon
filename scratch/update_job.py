import re

with open('backend/jobs/abandonedHoldJob.js', 'r', encoding='utf-8') as f:
    content = f.read()

coupon_restore_logic = """
    for (const apt of abandonedApts) {
      apt.status = 'cancelled';
      apt.paymentStatus = 'failed';
      apt.cancellationReason = 'Payment abandoned timeout (15m)';
      await apt.save();
      console.log(`[Job] Released abandoned booking: ${apt._id}`);

      // Restore coupon usage if any
      if (apt.couponId) {
        const Coupon = (await import('../models/Coupon.js')).default;
        await Coupon.findByIdAndUpdate(apt.couponId, { $inc: { usageCount: -1 } });
        console.log(`[Job] Restored coupon usage for: ${apt.couponId}`);
      }
    }
"""

content = re.sub(
    r"for \(const apt of abandonedApts\) \{[\s\S]*?console\.log\(`\[Job\] Released abandoned booking: \$\{apt\._id\}`\);\s*\}",
    coupon_restore_logic,
    content
)

with open('backend/jobs/abandonedHoldJob.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated abandonedHoldJob.js to restore coupon usage")
