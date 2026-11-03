from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class SubGuardException(Exception):
    def __init__(self, message: str, status_code: int = 400, details: dict | None = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)

def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(SubGuardException)
    async def subguard_exception_handler(request: Request, exc: SubGuardException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "message": exc.message,
                    "details": exc.details,
                    "type": exc.__class__.__name__,
                }
            },
        )
