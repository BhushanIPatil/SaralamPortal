from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

class AppException(Exception):
    """Base app exception."""

    def __init__(self, message: str, status_code: int = 400, details: Any = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND, details=details)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden", details: Any = None):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN, details=details)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized", details: Any = None):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED, details=details)


class UpgradeRequiredError(AppException):
    """HTTP 402 - subscription upgrade required."""

    def __init__(
        self,
        message: str = "Upgrade required",
        upgrade_url: str = "/pricing",
        feature: str | None = None,
        details: Any = None,
    ):
        super().__init__(message, status_code=status.HTTP_402_PAYMENT_REQUIRED, details=details)
        self.upgrade_url = upgrade_url
        self.feature = feature


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        body: dict[str, Any] = {
            "success": False,
            "message": exc.message,
            "data": None,
            "errors": [str(exc.details)] if exc.details else None,
        }
        if isinstance(exc, UpgradeRequiredError):
            body["upgrade_url"] = getattr(exc, "upgrade_url", "/pricing")
            body["feature"] = getattr(exc, "feature", None)
        return JSONResponse(status_code=exc.status_code, content=body)

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "message": str(exc), "data": None, "errors": None},
        )
