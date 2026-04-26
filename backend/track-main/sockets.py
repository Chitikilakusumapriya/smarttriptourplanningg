from flask_socketio import Namespace, join_room, leave_room, emit

class TrackNamespace(Namespace):
    def on_connect(self):
        # connection established
        print("Socket connected")

    def on_disconnect(self):
        print("Socket disconnected")

    def on_join(self, data):
        # data: { "driver_id": "<driver_id>" }
        driver_id = data.get("driver_id")
        if not driver_id:
            return
        join_room(driver_id)
        emit("joined", {"driver_id": driver_id})

    def on_leave(self, data):
        driver_id = data.get("driver_id")
        if not driver_id:
            return
        leave_room(driver_id)
        emit("left", {"driver_id": driver_id})
