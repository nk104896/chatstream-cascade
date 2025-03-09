
import React from "react";
import { Check } from "lucide-react";
import NavigationButton from "@/components/ui/NavigationButton";

const PricingPage: React.FC = () => {
  return (
    <div className="container px-4 py-24 mx-auto">
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto text-xl text-muted-foreground">
          Choose the plan that's right for you and start experiencing the power of
          multi-provider AI chat.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <div className="flex flex-col p-6 bg-background shadow-lg rounded-lg border border-muted">
          <div className="flex-1">
            <h2 className="text-xl font-bold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Perfect for trying out our platform
            </p>
            <div className="mt-6 text-3xl font-bold">$0</div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Free forever
            </p>

            <ul className="mt-6 space-y-4 text-sm">
              {[
                "Access to GPT-3.5",
                "5 messages per day",
                "Text-only messaging",
                "Basic chat history",
                "Standard customer support",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <NavigationButton
              variant="outline"
              className="w-full"
              label="Try for Free"
            />
          </div>
        </div>

        {/* Standard Plan */}
        <div className="relative flex flex-col p-6 bg-background shadow-lg rounded-lg border border-muted">
          <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium tracking-wider text-white transform translate-y-[-50%] bg-gradient-to-r from-pink-500 to-purple-500 rounded-full uppercase">
            Popular
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold">Standard</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For individuals who need more advanced features
            </p>
            <div className="mt-6 text-3xl font-bold">$15</div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              per month
            </p>

            <ul className="mt-6 space-y-4 text-sm">
              {[
                "All Free plan features",
                "Unlimited messages",
                "Access to GPT-4o",
                "Access to Claude 3",
                "Image understanding",
                "File upload support",
                "Priority customer support",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <NavigationButton className="w-full" label="Get Started" />
          </div>
        </div>

        {/* Pro Plan */}
        <div className="flex flex-col p-6 bg-background shadow-lg rounded-lg border border-muted">
          <div className="flex-1">
            <h2 className="text-xl font-bold">Pro</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For teams and professionals
            </p>
            <div className="mt-6 text-3xl font-bold">$29</div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              per month
            </p>

            <ul className="mt-6 space-y-4 text-sm">
              {[
                "All Standard plan features",
                "Team workspace",
                "Custom AI model fine-tuning",
                "Advanced analytics",
                "API access",
                "Custom branding",
                "Dedicated support",
                "99.9% uptime SLA",
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <NavigationButton className="w-full" label="Get Started" />
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold">Need a custom plan?</h2>
        <p className="mt-2 text-muted-foreground">
          Contact us for enterprise pricing and custom solutions.
        </p>
        <NavigationButton
          variant="outline"
          className="mt-6 px-8"
          label="Contact Sales"
        />
      </div>
    </div>
  );
};

export default PricingPage;
