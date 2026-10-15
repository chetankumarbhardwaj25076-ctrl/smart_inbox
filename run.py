"""Start the Smart Inbox server:  python run.py"""
import logging

import uvicorn

from backend import config

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    print(f"\n  Smart Inbox is running at {config.APP_BASE_URL}\n")
    uvicorn.run("backend.app:app", host=config.HOST, port=config.PORT, log_level="warning")
