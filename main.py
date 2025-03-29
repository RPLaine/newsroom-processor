"""
GameGen2 Main Module

The main entry point for the GameGen2 application.
"""
import sys
from server.server import GameGen2Server

if __name__ == "__main__":
    # Check for debug flag
    debug = "-debug" in sys.argv
    GameGen2Server.run_server(debug=debug)