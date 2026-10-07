using System;
using System.Linq;

namespace NacenTech.Modules.Assessment.Application;

public class Tt17ScoringService
{
    public double CalculateScore(Tt17Assessment assessment)
    {
        double score = 0;
        if (assessment.Criteria != null)
        {
            score = assessment.Criteria.Sum(c => c.Score);
        }
        return score;
    }
}
