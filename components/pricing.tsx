"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Phone } from "lucide-react"

export function Pricing() {
  const plans = [
    {
      name: "Small Team",
      price: "$299.99",
      period: "/user/month",
      users: "Up to 9 users",
      description: "$299.99 per user",
      features: [
        "Up to 9 users at $299.99 each",
        "Unlimited contacts",
        "Full CRM Suite",
        "Multi-channel messaging",
        "VoIP integration",
        "Bulk SMS marketing",
        "Email support",
        "10 GB storage",
      ],
    },
    {
      name: "Growing Business",
      price: "$249.99",
      period: "/user/month",
      users: "Up to 50 users",
      description: "$249.99 per user",
      features: [
        "Up to 50 users at $249.99 each",
        "Unlimited contacts",
        "Full CRM Suite",
        "Multi-channel messaging",
        "VoIP integration",
        "Bulk SMS marketing",
        "Priority support",
        "50 GB storage",
        "Advanced automation",
        "Analytics dashboard",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$199.99",
      period: "/user/month",
      users: "Up to 100 users",
      description: "$199.99 per user",
      features: [
        "Up to 100 users at $199.99 each",
        "Unlimited contacts",
        "Full CRM Suite",
        "Multi-channel messaging",
        "VoIP integration",
        "Bulk SMS marketing",
        "24/7 priority support",
        "Unlimited storage",
        "Custom integrations",
        "Advanced analytics",
        "Dedicated account manager",
      ],
    },
    {
      name: "Custom",
      price: "Contact Us",
      period: "",
      users: "100+ users",
      description: "Custom pricing",
      features: [
        "100+ users",
        "Unlimited everything",
        "White-label options",
        "Custom development",
        "Dedicated infrastructure",
        "SLA guarantees",
        "On-site training",
        "24/7 premium support",
      ],
      isCustom: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-white/60">Per-user pricing that scales with your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`bg-white/5 border-white/10 p-6 ${plan.popular ? "ring-2 ring-cyan-400" : ""}`}
          >
            {plan.popular && (
              <div className="text-center mb-4">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-sm text-cyan-400 mb-2">{plan.users}</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                {plan.period && <span className="text-white/60">{plan.period}</span>}
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.isCustom ? (
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                onClick={() => window.open("tel:2016404635", "_self")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 201-640-4635
              </Button>
            ) : (
              <Button
                className={`w-full ${plan.popular ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700" : "bg-white/10 hover:bg-white/20"}`}
              >
                Get Started
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
