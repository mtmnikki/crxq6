/**
 * ClinicalRxQ Homepage - Main marketing landing page
 * Includes hero, advantage, programs, metrics, testimonials, and CTA sections.
 */

import { useState } from 'react';
import { Link } from 'react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Play,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Target,
  Zap,
  Shield,
  Award,
  BookOpen,
  FileText,
  Heart,
  Quote,
  BookOpen,
  Stethoscope,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import SafeText from '../components/common/SafeText';

/**
 * Interface representing a program card item in the Programs section
 */
interface ProgramCardItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

/**
 * Small reusable card to display program information in the Programs section
 */
function ProgramCard({ item }: { item: ProgramCardItem }) {
  return (
    <Card className="bg-gray-800/70 border-gray-700 hover:bg-gray-800 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-white text-lg">
            <SafeText value={item.title} />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm mb-4">
          <SafeText value={item.description} />
        </p>
        <ul className="space-y-2">
          {item.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-400">
              <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
              <SafeText value={feature} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Homepage component
 */
export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Operational Flywheel',
      description:
        'Transform from reactive dispensing to proactive, appointment-based care with TimeMyMeds synchronization',
      icon: Target,
      color: 'from-green-300 to-teal-400',
    },
    {
      title: 'Technician Force Multiplier',
      description:
        'Empower your pharmacy technicians to handle operational tasks, freeing pharmacists for clinical excellence',
      icon: Users,
      color: 'from-teal-500 to-cyan-300',
    },
    {
      title: 'Turnkey Clinical Infrastructure',
      description:
        'Complete business-in-a-box solution with protocols, forms, billing codes, and implementation guides',
      icon: Shield,
      color: 'from-cyan-400 to-blue-700',
    },
  ];

  /**
   * Programs displayed in the homepage programs section
   */
  const programs: ProgramCardItem[] = [
    {
      title: 'TimeMyMeds',
      description: 'Create predictable appointment schedules that enable clinical service delivery',
      icon: Clock,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes'],
    },
    {
      title: 'MTM The Future Today',
      description:
        'Team-based Medication Therapy Management with proven protocols and technician workflows',
      icon: FileText,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes'],
    },
    {
      title: 'Test & Treat Services',
      description: 'Point-of-care testing and treatment for Flu, Strep, and COVID-19',
      icon: Zap,
      features: ['CLIA-Waived Testing', 'State Protocols', 'Medical Billing'],
    },
    {
      title: 'HbA1c Testing',
      description: 'Diabetes management with point-of-care A1c testing and clinical integration',
      icon: Award,
      features: ['Quality Metrics', 'Provider Communication', 'Value-Based Care'],
    },
    {
      title: 'Pharmacist-Initiated Oral Contraceptives',
      description:
        'From patient intake and care decisions, to billing and record-keeping, simplified service steps for your team and patients',
      icon: Heart,
      features: [
        'Practice-Based Clinical Skills',
        'Pharmacy Tech Training',
        'Prescribing with Confidence',
      ],
    },
  ];

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-500 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/cd53336d-d6e2-4c6b-bf62-bba9d1f359ba.png')] bg-center bg-cover opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <Badge className="bg-gradient-to-r from-blue-600 to-teal-400 text-white border-0">
                  Where Dispensing Meets Direct Patient Care
                </Badge>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  Pharmacy Practice
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The complete ecosystem for community pharmacy teams to deliver profitable, patient-centered
                clinical services with proven protocols and turnkey infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/programs">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-teal-300 hover:from-cyan-500 hover:to-teal-300 text-white shadow-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Explore Programs
                  </Button>
                </Link>
                <Link to="/enroll">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-blue-600 text-blue-700 hover:bg-blue-200"
                  >
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  No long-term contracts
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  30-day money-back guarantee
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/586a328a-c576-4a4b-ab52-e4c62129d105.png"
                  alt="Pharmacist providing clinical care"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* The ClinicalRxQ Advantage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0 mb-4">
              THE CLINICALRXQ ADVANTAGE
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              A better way to build your{' '}
              <span className="bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent">clinical practice</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our integrated ecosystem addresses the primary barriers—time, workflow, and profitability—that
              have historically hindered widespread adoption of advanced clinical services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-cyan-500' : ''
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}></div>
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    <SafeText value={feature.title} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <SafeText value={feature.description} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading and description */}
          <div className="mb-14 text-left">
            <p className="text-2xl sm:text-3xl font-semibold text-white/90">Comprehensive, Team-Based</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-1">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Training &amp; Resources
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mt-6 max-w-3xl">
              Practice-based training modules, step-by-step implementation protocols, and specialized
              documentation forms and resources built for community pharmacy teams, by community pharmacy teams.
            </p>
            <p className="text-sm sm:text-base text-gray-400 mt-4">
              Tested. Refined. Shared. Transform the profession by transforming our practice.
            </p>

            <div className="mt-6">
              <Link to="/programs">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-cyan-500 text-cyan-400 hover:bg-white hover:text-gray-900"
                >
                  View All Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Program cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Row 1: first three cards */}
            <ProgramCard item={programs[0]} />
            <ProgramCard item={programs[1]} />
            <ProgramCard item={programs[2]} />

            {/* Row 2: pharmacist image at bottom-left */}
            <div className="hidden md:block relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700 shadow-xl">
              <img
                src="https://pub-cdn.sider.ai/u/U03VH4NVNOE/web-coder/687655a5b1dac45b18db4f5c/resource/f91471b8-97b6-486e-b92b-c30c929298d4.png"
                alt="Pharmacist gesturing to programs"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
            </div>

            {/* Row 2: two more cards to the right */}
            <ProgramCard item={programs[3]} />
            <ProgramCard item={programs[4]} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-800 via-cyan-500 to-teal-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Practice?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of pharmacy professionals who have revolutionized their practice with ClinicalRxQ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/enroll">
              <Button size="lg" className="bg-blue-800 text-white hover:bg-teal-500 shadow-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Your Transformation
              </Button>
            </Link>
            <Link to="/programs">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-teal-400 text-teal-400 hover:bg-white hover:text-cyan-600"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
