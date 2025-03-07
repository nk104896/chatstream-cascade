
import os
import subprocess
import sys

def install_requirements():
    print("Checking and installing required packages...")
    requirements_path = os.path.join("backend", "requirements.txt")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", requirements_path], check=True)

def main():
    # Step 0: Install requirements
    try:
        install_requirements()
    except subprocess.CalledProcessError:
        print("Error: Failed to install required packages")
        sys.exit(1)
    
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
