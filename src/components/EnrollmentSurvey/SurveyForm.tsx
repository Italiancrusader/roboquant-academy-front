
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface SurveyFormProps {
  step: number;
  onStepSubmit: (data: Record<string, any>) => void;
  onComplete: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  initialData: Record<string, any>;
}

const SurveyForm: React.FC<SurveyFormProps> = ({
  step,
  onStepSubmit,
  onComplete,
  isSubmitting,
  initialData
}) => {
  const form = useForm({
    defaultValues: initialData
  });
  
  const handleNextStep = (data: Record<string, any>) => {
    onStepSubmit(data);
  };
  
  const handleSubmit = (data: Record<string, any>) => {
    onComplete(data);
  };
  
  // Define industry options
  const industries = [
    "Finance",
    "Technology",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Real Estate",
    "Transportation",
    "Energy",
    "Government",
    "Other"
  ];
  
  // Define job titles
  const jobTitles = [
    "Software Developer",
    "Finance Professional",
    "Student",
    "Freelancer",
    "Business Owner",
    "Trader",
    "Financial Advisor",
    "Unemployed",
    "Engineer",
    "Manager",
    "Executive",
    "Other"
  ];
  
  // Define countries
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Japan",
    "China",
    "India",
    "Brazil",
    // Add more countries as needed
  ];
  
  // Content for each step of the survey
  switch (step) {
    case 1:
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
            <FormField
              control={form.control}
              name="tradingExperience"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How much trading experience do you have?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="I've never traded" id="exp-none" />
                        <Label htmlFor="exp-none">I've never traded</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0–1 year" id="exp-0-1" />
                        <Label htmlFor="exp-0-1">0–1 year</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1–3 years" id="exp-1-3" />
                        <Label htmlFor="exp-1-3">1–3 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3–5 years" id="exp-3-5" />
                        <Label htmlFor="exp-3-5">3–5 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5–10 years" id="exp-5-10" />
                        <Label htmlFor="exp-5-10">5–10 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10+ years" id="exp-10+" />
                        <Label htmlFor="exp-10+">10+ years</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="botExperience"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>How much experience do you have using or building trading bots?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="None" id="bot-none" />
                        <Label htmlFor="bot-none">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0–1 year" id="bot-0-1" />
                        <Label htmlFor="bot-0-1">0–1 year</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1–3 years" id="bot-1-3" />
                        <Label htmlFor="bot-1-3">1–3 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3–5 years" id="bot-3-5" />
                        <Label htmlFor="bot-3-5">3–5 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5–10 years" id="bot-5-10" />
                        <Label htmlFor="bot-5-10">5–10 years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10+ years" id="bot-10+" />
                        <Label htmlFor="bot-10+">10+ years</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      );
      
    case 2:
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
            <FormField
              control={form.control}
              name="tradingGoal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What's your primary goal with trading bots?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Personal use to grow my own capital" id="goal-personal" />
                        <Label htmlFor="goal-personal">Personal use to grow my own capital</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pass prop firm challenges" id="goal-prop" />
                        <Label htmlFor="goal-prop">Pass prop firm challenges</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Resell bots or signals" id="goal-resell" />
                        <Label htmlFor="goal-resell">Resell bots or signals</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Offer bot development as a freelance service" id="goal-freelance" />
                        <Label htmlFor="goal-freelance">Offer bot development as a freelance service</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Other" id="goal-other" />
                        <Label htmlFor="goal-other">Other</Label>
                      </div>
                      {field.value === "Other" && (
                        <Input
                          placeholder="Please specify"
                          onChange={(e) => form.setValue("tradingGoalOther", e.target.value)}
                          className="ml-6 w-[80%]"
                        />
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tradingCapital"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What amount of capital do you actively trade with right now?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Less than $1,000" id="cap-1k" />
                        <Label htmlFor="cap-1k">Less than $1,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="$1,000 – $5,000" id="cap-1k-5k" />
                        <Label htmlFor="cap-1k-5k">$1,000 – $5,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="$5,000 – $10,000" id="cap-5k-10k" />
                        <Label htmlFor="cap-5k-10k">$5,000 – $10,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="$10,000 – $250,000" id="cap-10k-250k" />
                        <Label htmlFor="cap-10k-250k">$10,000 – $250,000</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Over $250,000" id="cap-250k+" />
                        <Label htmlFor="cap-250k+">Over $250,000</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onStepSubmit({ step: -1 })}>
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      );
      
    case 3:
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
            <FormField
              control={form.control}
              name="propFirmUsage"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do you currently trade with any prop firms?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="prop-yes" />
                        <Label htmlFor="prop-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No, but I plan to" id="prop-plan" />
                        <Label htmlFor="prop-plan">No, but I plan to</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No, and I don't intend to" id="prop-no" />
                        <Label htmlFor="prop-no">No, and I don't intend to</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="botDevelopmentExperience"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Have you ever developed or customized a trading bot before?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="developed-yes" />
                        <Label htmlFor="developed-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No, but I've used them" id="developed-used" />
                        <Label htmlFor="developed-used">No, but I've used them</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No, and I'm new to the concept" id="developed-new" />
                        <Label htmlFor="developed-new">No, and I'm new to the concept</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onStepSubmit({ step: -1 })}>
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      );
      
    case 4:
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What best describes your current job title?</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your job title" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobTitles.map((title) => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In which industry do you work?</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What's your age group?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="18–24" id="age-18-24" />
                        <Label htmlFor="age-18-24">18–24</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="25–34" id="age-25-34" />
                        <Label htmlFor="age-25-34">25–34</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="35–44" id="age-35-44" />
                        <Label htmlFor="age-35-44">35–44</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="45–54" id="age-45-54" />
                        <Label htmlFor="age-45-54">45–54</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="55+" id="age-55+" />
                        <Label htmlFor="age-55+">55+</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onStepSubmit({ step: -1 })}>
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      );
      
    case 5:
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="gender-male" />
                        <Label htmlFor="gender-male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="gender-female" />
                        <Label htmlFor="gender-female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Prefer not to say" id="gender-prefer-not" />
                        <Label htmlFor="gender-prefer-not">Prefer not to say</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where are you located?</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (with country code)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => onStepSubmit({ step: -1 })}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      );
      
    default:
      return null;
  }
};

export default SurveyForm;
