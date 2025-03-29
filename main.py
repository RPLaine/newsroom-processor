"""
GameGen2 Main Module

The main entry point for the GameGen2 application.
"""
import sys
from server.server import GameServer

if __name__ == "__main__":
    # Check for debug flag
    debug = "-debug" in sys.argv
    GameServer.run_server(debug=debug)