import type { Icon } from "@tabler/icons-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Container, SimpleGrid, Text, Title } from "@mantine/core";
import { IconBriefcase2, IconMoneybag, IconVideo } from "@tabler/icons-react";

import classes from "./products.module.css";

interface ProductProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: Icon;
  title: string;
  description: string;
}

function Product({
  icon: Icon,
  title,
  description,
  href,
  className,
  ...others
}: ProductProps): ReactNode {
  return (
    <a
      className={classes.feature}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...others}
    >
      <div className={classes.overlay} />

      <div className={classes.content}>
        <Icon className={classes.icon} size={38} stroke={1.5} />
        <Text className={classes.title} fw={700} fz="lg" mb="xs" mt={5}>
          {title}
        </Text>
        <Text c="dimmed" fz="sm">
          {description}
        </Text>
      </div>
    </a>
  );
}

const data = [
  {
    icon: IconBriefcase2,
    title: "Portfolio",
    description: "Portfolio page with NextJS and Mantine",
    href: "https://github.com/khanhduyvt0101/khanhduy-portfolio",
  },
  {
    icon: IconVideo,
    title: "Video Magician",
    description:
      "Custom GPT tool for Video: Edit, summarize, translate, and more",
    href: "https://chatgpt.com/g/g-18KlZfXDZ-video-magician-edit-convert-cut-the-video",
  },
  {
    icon: IconMoneybag,
    title: "Expense Expert",
    description: "Custom GPT tool for expense tracking and management",
    href: "https://chatgpt.com/g/g-GOrMcn5Tx-expense-expert-auto-tracking-your-expensest",
  },
];

export function Products(): ReactNode {
  const products = data.map((item) => <Product {...item} key={item.title} />);

  return (
    <div className={classes.wrapper}>
      <Container className={classes.inner} mb={30} mt={30} size="lg">
        <Title mb="md" order={2}>
          Products
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={50}>
          {products}
        </SimpleGrid>
      </Container>
    </div>
  );
}
