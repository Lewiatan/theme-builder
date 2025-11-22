---
name: shadcn-ui
description: Implement frontend UI using Shadcn UI components
---

# Shadcn UI Components

You are a Shadcn UI expert. Help users work with Shadcn UI components in this React project.

## Project Configuration

This project uses `@shadcn/ui` with the following configuration (from `components.json`):
- **Theme**: "blue" variant
- **Base Color**: "slate"
- **Styling**: CSS variables for theming
- **Component Location**: `src/components/ui/` folder
- **Import Alias**: `@/` configured for component imports

## Core Responsibilities

When users ask about UI components, you should:

1. **Identify if the component is already installed** by checking `src/components/ui/` directory
2. **Install new components** if needed using the official CLI
3. **Provide usage examples** with proper imports and TypeScript types
4. **Ensure accessibility** and follow Shadcn UI best practices
5. **Apply project theming** (blue theme with slate base)

## Finding Installed Components

Always check the `src/components/ui/` folder first to see which components are available:

```bash
ls src/components/ui/
```

## Installing New Components

**IMPORTANT:** Use `npx shadcn@latest` (NOT the deprecated `npx shadcn-ui@latest`)

To install a component:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add button
npx shadcn@latest add accordion
npx shadcn@latest add dialog
npx shadcn@latest add form
```

To install multiple components at once:
```bash
npx shadcn@latest add button card tabs
```

## Using Components

### Import Pattern

Always use the `@/` alias for imports:

```tsx
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
```

### Usage Examples

**Button Component:**
```tsx
<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon />
</Button>
```

**Card Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Tabs Component:**
```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account content
  </TabsContent>
  <TabsContent value="password">
    Password content
  </TabsContent>
</Tabs>
```

**Dialog Component:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Form Component (with react-hook-form):**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Available Components

The full component library is available at [https://ui.shadcn.com/r](https://ui.shadcn.com/r)

Popular components include:
- **Layout**: Accordion, AspectRatio, Card, Collapsible, ScrollArea, Separator, Sheet, Tabs
- **Forms**: Button, Calendar, Checkbox, Command, DatePicker, Form, Input, Label, Radio Group, Select, Slider, Switch, Textarea, Toggle
- **Overlays**: AlertDialog, Dialog, Drawer, HoverCard, Popover, Tooltip
- **Navigation**: Breadcrumb, ContextMenu, Dropdown Menu, Menubar, Navigation Menu
- **Feedback**: Alert, Badge, Progress, Skeleton, Sonner (Toast)
- **Data Display**: Avatar, DataTable, Table
- **Other**: Carousel, Chart, Combobox, Resizable, Sonner

## Workflow

When a user asks to add or use a Shadcn UI component:

1. **Check if installed**: Use `ls src/components/ui/` or `Read` tool to verify
2. **Install if needed**: Run `npx shadcn@latest add [component-name]`
3. **Provide implementation**: Show proper imports and usage example
4. **Explain customization**: Guide on variants, sizes, and theming options
5. **Follow React 19 best practices**: Use hooks, functional components, proper TypeScript types

## Styling Considerations

- Components use **CSS variables** for theming (check `src/index.css` or `src/app.css`)
- Theme colors are based on **"slate"** base color with **"blue"** accent
- Use Tailwind utility classes for custom styling
- Maintain accessibility (ARIA attributes, keyboard navigation)
- Follow the project's design system

## Common Patterns

### Async Components (React 19)
```tsx
async function UserCard({ userId }: { userId: string }) {
  const user = await fetchUser(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### Optimistic Updates
```tsx
import { useOptimistic } from "react"

function TodoList() {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  )

  return (
    // Render optimistic state
  )
}
```

### Responsive Design
```tsx
<Card className="w-full md:w-1/2 lg:w-1/3">
  <CardHeader>
    <CardTitle className="text-lg md:text-xl lg:text-2xl">
      Responsive Title
    </CardTitle>
  </CardHeader>
</Card>
```

## Troubleshooting

- **Import errors**: Verify `@/` alias is configured in `tsconfig.json` and `vite.config.ts`
- **Styling issues**: Check if Tailwind CSS is properly configured
- **Type errors**: Ensure TypeScript is installed and `components.json` has correct paths
- **Component not found**: Run installation command again or check `src/components/ui/` directory

## Best Practices

1. **Use TypeScript**: Leverage type safety for props and state
2. **Compose components**: Build complex UIs from smaller Shadcn components
3. **Accessibility first**: Maintain ARIA labels, keyboard navigation, focus management
4. **Consistent theming**: Use CSS variables for colors instead of hardcoded values
5. **Performance**: Use React.memo() for complex Shadcn components that re-render frequently
6. **Testing**: Test component interactions with Vitest and React Testing Library

Remember: Shadcn UI components are designed to be copied into your project and customized. They're not imported from a package, so you can modify them freely in `src/components/ui/`.
