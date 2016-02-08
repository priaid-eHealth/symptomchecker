using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Priaid.Diagnosis.Client.Model
{
    public class AccessToken
    {
        public string Token { get; set; }
        public int ValidThrough { get; set; }
    }
}
