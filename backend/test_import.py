import sys
import traceback

try:
    import app.main
    print("Backend import successful")
except Exception as e:
    print(f"Error importing app.main: {e}")
    traceback.print_exc()
