"""
Dolphin LLM Test Client

This script sends custom prompts to the Dolphin LLM server with configurable
generation parameters, supporting both streaming and non-streaming modes.

Usage:
    python test.py [--stream] [--prompt PROMPT] [--max_length MAX_LENGTH]
                   [--temperature TEMP] [--top_k TOP_K] [--top_p TOP_P]
                   [--repetition_penalty REP_PENALTY]

Example:
    python test.py --prompt "Explain quantum computing" --stream --max_length 300
"""

import requests
import argparse
import sys

def parse_arguments():
    """Parse command-line arguments for the test client."""
    parser = argparse.ArgumentParser(description='Test the Dolphin LLM server with custom parameters.')
    parser.add_argument('--stream', action='store_true', help='Use streaming mode')
    parser.add_argument('--prompt', type=str, default="Explain how language models work in simple terms.",
                        help='Text prompt for generation')
    parser.add_argument('--max_length', type=int, default=500,
                        help='Maximum length of generated text')
    parser.add_argument('--temperature', type=float, default=1.0,
                        help='Sampling temperature (higher = more random)')
    parser.add_argument('--top_k', type=int, default=50,
                        help='Number of highest probability tokens to keep')
    parser.add_argument('--top_p', type=float, default=0.9,
                        help='Nucleus sampling parameter')
    parser.add_argument('--repetition_penalty', type=float, default=1.0,
                        help='Penalty for token repetition')
    return parser.parse_args()


def send_request(args):
    """
    Send a request to the Dolphin LLM server with the specified parameters.
    
    Args:
        args: Parsed command-line arguments
        
    Returns:
        The server response
    """
    url = 'http://localhost:5000'
    
    payload = {
        'prompt': args.prompt,
        'max_length': args.max_length,
        'stream': args.stream,
        'temperature': args.temperature,
        'top_k': args.top_k,
        'top_p': args.top_p,
        'repetition_penalty': args.repetition_penalty
    }
    
    print("\n" + "=" * 60)
    print(f"🐬 Dolphin LLM Request")
    print("=" * 60)
    print(f"Prompt: {args.prompt}")
    print(f"Parameters: max_length={args.max_length}, temperature={args.temperature}, "
          f"top_k={args.top_k}, top_p={args.top_p}, repetition_penalty={args.repetition_penalty}")
    print(f"Streaming: {args.stream}")
    print("=" * 60 + "\n")
    
    try:
        response = requests.post(
            url,
            json=payload,
            stream=args.stream,
            headers={'Accept': 'text/event-stream' if args.stream else 'application/json'}
        )
        
        response.raise_for_status()
        return response
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the server is running.")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


def handle_response(response, streaming):
    """
    Process and display the server response.
    
    Args:
        response: The server response
        streaming: Boolean indicating if streaming mode is enabled
    """
    print("\n" + "=" * 60)
    print("🐬 Dolphin LLM Response")
    print("=" * 60 + "\n")
    
    if streaming:
        try:
            for chunk in response.iter_content(chunk_size=1):
                if chunk:
                    print(chunk.decode('utf-8'), end='', flush=True)
        except Exception as e:
            print(f"\nError during streaming: {e}", file=sys.stderr)
    else:
        print(response.text)
    
    print("\n" + "=" * 60)


def main():
    """Main entry point for the test client."""
    args = parse_arguments()
    response = send_request(args)
    handle_response(response, args.stream)


if __name__ == "__main__":
    main()