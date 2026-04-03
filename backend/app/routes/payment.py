import stripe
from fastapi import APIRouter

router = APIRouter()

stripe.api_key = "YOUR_SECRET_KEY"

@router.post("/create-checkout-session")
def create_checkout():
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        line_items=[{
            "price": "YOUR_PRICE_ID",  
            "quantity": 1,
        }],
        success_url="http://localhost:5173/success",
        cancel_url="http://localhost:5173/cancel",
    )

    return {"url": session.url}