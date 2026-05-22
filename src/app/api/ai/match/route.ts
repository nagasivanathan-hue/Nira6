import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import CreatorProfile from '@/models/CreatorProfile';

interface CreatorProfilePopulated {
  _id: { toString(): string };
  userId?: { _id?: { toString(): string }; name?: string; avatar?: string; email?: string; phone?: string };
  category: string;
  title: string;
  bio: string;
  location: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  startingPrice: number;
  hourlyRate: number;
  availability: string;
  verified: boolean;
  trustScore: number;
  portfolio: string[];
  skills: string[];
  styles: string[];
  gear: string[];
  languages: string[];
  experience: number;
  responseTime: string;
  featured: boolean;
  tags: string[];
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    const {
      category,
      skills = [],
      maxBudget,
      minExperience = 1,
      styles = [],
    } = data;

    // Fetch all profiles to calculate recommendations
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const profiles = await CreatorProfile.find(query)
      .populate('userId', 'name avatar email phone')
      .lean() as unknown as CreatorProfilePopulated[];

    const scored = profiles.map((p: CreatorProfilePopulated) => {
      const scoreDetails = {
        categoryMatch: 1.0,
        skillsOverlap: 0.0,
        budgetScore: 1.0,
        ratingScore: 0.0,
        experienceScore: 0.0,
        styleScore: 0.0,
        trustBonus: 0.0
      };

      // 1. Category Match (if requested all, check relative fit)
      if (category && category !== 'all') {
        scoreDetails.categoryMatch = p.category === category ? 1.0 : 0.0;
      }

      // 2. Skills Overlap
      if (skills.length > 0) {
        const matchingSkills = p.skills.filter((s: string) => 
          skills.some((reqSkill: string) => reqSkill.toLowerCase() === s.toLowerCase())
        );
        scoreDetails.skillsOverlap = matchingSkills.length / skills.length;
      } else {
        scoreDetails.skillsOverlap = 1.0;
      }

      // 3. Budget Score
      if (maxBudget) {
        const preferred = Number(maxBudget);
        if (p.startingPrice <= preferred) {
          scoreDetails.budgetScore = 1.0;
        } else {
          // Exponential decay for budgets exceeding target
          scoreDetails.budgetScore = Math.max(0, Math.exp(-(p.startingPrice - preferred) / preferred));
        }
      }

      // 4. Rating Score
      scoreDetails.ratingScore = p.rating / 5.0;

      // 5. Experience Score
      const reqExp = Number(minExperience) || 1;
      scoreDetails.experienceScore = Math.min(p.experience / reqExp, 1.0);

      // 6. Style Score
      if (styles.length > 0) {
        const matchingStyles = p.styles.filter((s: string) =>
          styles.some((reqStyle: string) => reqStyle.toLowerCase() === s.toLowerCase())
        );
        scoreDetails.styleScore = matchingStyles.length / styles.length;
      } else {
        scoreDetails.styleScore = 1.0;
      }

      // 7. Trust Bonus
      if (p.verified) scoreDetails.trustBonus += 0.1;
      if (p.trustScore > 90) scoreDetails.trustBonus += 0.05;

      // Weights calculation
      const categoryWeight = 0.30;
      const skillsWeight = 0.20;
      const budgetWeight = 0.20;
      const ratingWeight = 0.15;
      const experienceWeight = 0.05;
      const styleWeight = 0.10;

      const totalScore = (
        (scoreDetails.categoryMatch * categoryWeight) +
        (scoreDetails.skillsOverlap * skillsWeight) +
        (scoreDetails.budgetScore * budgetWeight) +
        (scoreDetails.ratingScore * ratingWeight) +
        (scoreDetails.experienceScore * experienceWeight) +
        (scoreDetails.styleScore * styleWeight) +
        scoreDetails.trustBonus
      );

      // Final match percentage (capped at 100%)
      const matchPercentage = Math.round(Math.min(1.0, totalScore) * 100);

      return {
        creator: {
          id: p._id.toString(),
          userId: p.userId?._id?.toString(),
          name: p.userId?.name || 'Anonymous Creator',
          avatar: p.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          category: p.category,
          title: p.title,
          bio: p.bio,
          location: p.location,
          rating: p.rating,
          reviewCount: p.reviewCount,
          completedJobs: p.completedJobs,
          startingPrice: p.startingPrice,
          hourlyRate: p.hourlyRate,
          availability: p.availability,
          verified: p.verified,
          skills: p.skills,
          styles: p.styles,
          gear: p.gear
        },
        matchPercentage,
        scoreDetails
      };
    });

    // Sort by match percentage in descending order
    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json(scored.slice(0, 10)); // return top 10 matches
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
