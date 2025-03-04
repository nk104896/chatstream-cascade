
import os
import subprocess
import sys

def main():
    # Step 1: Run the build script
    print("Building React frontend...")
    build_result = subprocess.run([sys.executable, "build.py"], check=False)
    
    if build_result.returncode != 0:
        print("Error: Failed to build frontend")
        sys.exit(1)
    
    # Step 2: Start the backend server
    print("Starting backend server...")
    os.chdir("backend")
    subprocess.run([sys.executable, "run.py"], check=True)

if __name__ == "__main__":
    main()
