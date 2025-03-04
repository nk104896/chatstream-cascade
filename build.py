
import os
import shutil
import subprocess
import sys

def main():
    print("Building React frontend and setting up for backend deployment...")
    
    # Step 1: Build the React app
    print("Building React application...")
    result = subprocess.run(["npm", "run", "build"], check=False)
    
    if result.returncode != 0:
        print("Error: Failed to build React application")
        sys.exit(1)
    
    # Step 2: Create static directory in backend if it doesn't exist
    backend_static_dir = os.path.join("backend", "static")
    if os.path.exists(backend_static_dir):
        print(f"Cleaning existing {backend_static_dir} directory...")
        shutil.rmtree(backend_static_dir)
    
    print(f"Creating {backend_static_dir} directory...")
    os.makedirs(backend_static_dir)
    
    # Step 3: Copy build files to backend static directory
    print("Copying build files to backend static directory...")
    build_dir = "dist"
    
    for item in os.listdir(build_dir):
        source = os.path.join(build_dir, item)
        destination = os.path.join(backend_static_dir, item)
        
        if os.path.isdir(source):
            shutil.copytree(source, destination)
        else:
            shutil.copy2(source, destination)
    
    print("Build process complete!")
    print("You can now run the backend server with: python backend/run.py")

if __name__ == "__main__":
    main()
