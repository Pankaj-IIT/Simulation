import os
import subprocess
import sys


def run_git_command(command):
    """Helper function to run git commands and handle errors."""
    try:
        result = subprocess.run(
            command, check=True, text=True, capture_output=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error executing command: {' '.join(command)}")
        print(f"Details: {e.stderr.strip()}")
        sys.exit(1)


def auto_commit():
    print("🚀 Git Auto-Commit Assistant 🚀")
    print("-" * 35)

    # 1. Check if the current directory is a git repository
    if not os.path.exists(".git"):
        print(
            "❌ Error: This directory is not a Git repository. Run 'git init' first."
        )
        return

    # 2. Check if there are any changes to commit
    status = run_git_command(["git", "status", "--porcelain"])
    if not status.strip():
        print("💡 No changes detected. Nothing to commit!")
        return

    # Show current changes to the user
    print("Current changes detected:")
    print(status)

    # 3. Prompt user for the commit message (name of changes)
    commit_message = input("📝 Enter the name of your changes (commit message): ").strip()

    if not commit_message:
        print("❌ Commit message cannot be empty. Operation cancelled.")
        return

    print("\nProcessing your commit...")

    # 4. Stage all changes (git add .)
    print("📁 Staging changes...")
    run_git_command(["git", "add", "."])

    # 5. Commit changes (git commit -m "message")
    print("🔒 Committing changes...")
    commit_output = run_git_command(["git", "commit", "-m", commit_message])
    print(commit_output.strip())

    # 6. Ask user if they want to push to the remote repository
    push_choice = (
        input("\n🌐 Do you want to push these changes to GitHub? (y/n): ")
        .strip()
        .lower()
    )

    if push_choice in ["y", "yes"]:
        print("☁️ Pushing to GitHub remote master/main branch...")
        # Automatically detects current branch and pushes to origin
        current_branch = run_git_command(
            ["git", "branch", "--show-current"]
        ).strip()
        push_output = run_git_command(["git", "push", "origin", current_branch])
        print(push_output.strip())
        print("✅ Pushed successfully!")
    else:
        print("✅ Changes committed locally! Remember to push later.")


if __name__ == "__main__":
    auto_commit()