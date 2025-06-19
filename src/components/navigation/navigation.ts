import { Frame, PieChart, Map, LifeBuoy, Send, Settings2, BookOpen, Bot, SquareTerminal, Home, BarChart } from "lucide-react";

export const navigation = {
  user: {
    name: "Remco Stoeten",
    email: "stoetenremco.rs@gmail.com",
    avatar: "https://pa1.narvii.com/5858/8b61faaa49264942a3cf812503cccab83fe515a8_hq.gif",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "/admin/models",
      icon: Bot,
      items: [
        {
          title: "Manage Models",
          url: "/admin/models",
        },
        {
          title: "Model Statistics",
          url: "/admin/models/stats",
          icon: BarChart
        },
        {
          title: "Install New Models",
          url: "/setup",
        }
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/admin/settings",
        },
        {
          title: "Models",
          url: "/admin/models",
        }
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}
