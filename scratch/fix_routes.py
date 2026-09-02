with open('backend/routes/appointmentRoutes.js', 'r', encoding='utf-8') as f:
    routes = f.read()

# Make sure imports are there precisely once.
if "createInstantBooking" not in routes:
    routes = routes.replace("import {\n  createAppointment,", "import {\n  createInstantBooking,\n  createScheduledBooking,\n  createAppointment,", 1)
    
if "router.post('/instant', protect, createInstantBooking);" not in routes:
    routes = routes.replace("router.post('/', protect, createAppointment);", "router.post('/', protect, createAppointment);\nrouter.post('/instant', protect, createInstantBooking);\nrouter.post('/scheduled', protect, createScheduledBooking);")

with open('backend/routes/appointmentRoutes.js', 'w', encoding='utf-8') as f:
    f.write(routes)
print("Updated appointmentRoutes.js")
