using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Priaid.Diagnosis.Client.Model
{
    public class AccessToken
    {
        /// <summary>
        /// Token string
        /// </summary>
        public string Token { get; set; }

        /// <summary>
        /// Valid period of token in seconds
        /// </summary>
        public int ValidThrough { get; set; }
    }
}
