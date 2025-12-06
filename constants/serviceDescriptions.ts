// Service descriptions for showcase-only vendors
export const SERVICE_DESCRIPTIONS: Record<string, string> = {
  Professionals:
    "<p>Connect with skilled professionals for all your service needs.</p><ul><li>Verified and experienced experts</li><li>Quality workmanship guaranteed</li><li>Competitive pricing</li></ul>",
  "Financial Planning":
    "<p>Expert <strong>financial planning services</strong> to help you achieve your wealth goals.</p><ul><li>Personalized investment strategies</li><li>Retirement planning</li><li>Tax optimization</li></ul>",
  AIF: "<p><strong>Alternative Investment Funds</strong> for sophisticated investors seeking higher returns.</p><ul><li>Diversified portfolio options</li><li>Professional fund management</li><li>Regulatory compliance assured</li></ul>",
  "Portfolio Management Services":
    "<p>Customized <strong>portfolio management</strong> tailored to your risk appetite and goals.</p><ul><li>Active portfolio monitoring</li><li>Risk-adjusted returns</li><li>Transparent reporting</li></ul>",
  "Mutual Fund":
    "<p>Invest in <strong>mutual funds</strong> with expert guidance for long-term wealth creation.</p><ul><li>Wide range of fund options</li><li>SIP and lump sum investments</li><li>Regular performance reviews</li></ul>",
  "Insurance Services":
    "<p>Comprehensive insurance solutions to protect what matters most to you and your family.</p><ul><li>Tailored coverage options</li><li>Quick claim processing</li><li>24/7 customer support</li></ul>",
  Motor:
    "<p>Complete <strong>motor insurance</strong> coverage for your vehicles.</p><ul><li>Own damage & third-party coverage</li><li>Cashless garage network</li><li>Quick claim settlement</li></ul>",
  Health:
    "<p>Complete <strong>health insurance plans</strong> for you and your family's medical needs.</p><ul><li>Cashless hospitalization</li><li>Pre & post hospitalization coverage</li><li>No claim bonus benefits</li></ul>",
  Fire: "<p>Protect your property and assets with our <strong>comprehensive fire insurance coverage</strong>.</p><ul><li>Coverage for residential & commercial properties</li><li>Protection against fire, lightning & explosion</li><li>Fast claim settlement</li></ul>",
  Marine:
    "<p><strong>Marine insurance</strong> to safeguard your cargo and vessels.</p><ul><li>Cargo and hull coverage</li><li>International transit protection</li><li>Comprehensive risk coverage</li></ul>",
  Electrician:
    "<p>Professional <strong>electrical services</strong> for your home and office.</p><ul><li>Installation & repair work</li><li>Safety inspections</li><li>Emergency services available</li></ul>",
  Tailor:
    "<p>Expert <strong>tailoring and alteration services</strong> for perfect fitting.</p><ul><li>Custom stitching</li><li>Alterations & repairs</li><li>Designer wear expertise</li></ul>",
  Painter:
    "<p>Professional <strong>painting services</strong> to transform your spaces.</p><ul><li>Interior & exterior painting</li><li>Texture and decorative finishes</li><li>Quality materials used</li></ul>",
  Plumber:
    "<p>Reliable <strong>plumbing services</strong> for all your water and drainage needs.</p><ul><li>Installation & repairs</li><li>Leak detection & fixing</li><li>24/7 emergency service</li></ul>",
  Tutor:
    "<p>Experienced <strong>tutors</strong> to help students excel academically.</p><ul><li>Personalized teaching approach</li><li>All subjects & competitive exams</li><li>Flexible timings</li></ul>",
  "Life Coach":
    "<p>Transform your life with professional <strong>life coaching</strong> guidance.</p><ul><li>Goal setting & achievement</li><li>Personal development</li><li>Work-life balance strategies</li></ul>",
  "Real Estate Advisor":
    "<p>Expert <strong>real estate advisory</strong> for smart property decisions.</p><ul><li>Property buying & selling</li><li>Market analysis & valuation</li><li>Legal documentation support</li></ul>",
  "Research and Analysis":
    "<p>In-depth <strong>research and analysis services</strong> for informed decision-making.</p><ul><li>Market research</li><li>Data analysis & insights</li><li>Custom reports</li></ul>",
  Car: "<p>Comprehensive <strong>vehicle insurance</strong> with extensive coverage and quick claim settlement.</p><ul><li>Own damage & third-party coverage</li><li>Roadside assistance</li><li>Zero depreciation add-on available</li></ul>",
  Life: "<p>Secure your family's future with our <strong>flexible life insurance policies</strong>.</p><ul><li>Term & whole life plans</li><li>Investment-linked options</li><li>Tax benefits under Section 80C</li></ul>",
};

export const getServiceDescription = (serviceName: string): string => {
  if (SERVICE_DESCRIPTIONS[serviceName]) {
    return SERVICE_DESCRIPTIONS[serviceName];
  }

  // Default description
  return `<p>Professional <strong>${serviceName.toLowerCase()}</strong> services tailored to your needs.</p><ul><li>Experienced and skilled providers</li><li>Quality service guaranteed</li><li>Competitive pricing</li></ul>`;
};
