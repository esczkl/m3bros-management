import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { BRANCHES } from '../../config/constants';
import { formatCurrency } from '../../utils/helpers';

export function ServicesManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Flatten all services from BRANCHES for display
  const allServices = useMemo(() => {
    const services = [];

    Object.entries(BRANCHES).forEach(([branchKey, branch]) => {
      Object.entries(branch.services).forEach(([serviceType, categories]) => {
        Object.entries(categories).forEach(([category, items]) => {
          items.forEach(item => {
            services.push({
              branchKey,
              branchName: branch.name,
              serviceType,
              category,
              name: item.name,
              price: item.price
            });
          });
        });
      });
    });

    return services;
  }, []);

  // Filter services based on search and branch
  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      const matchesSearch = searchTerm === '' ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === 'all' || service.branchKey === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [allServices, searchTerm, selectedBranch]);

  // Group filtered services by branch > serviceType > category
  const groupedServices = useMemo(() => {
    const grouped = {};

    filteredServices.forEach(service => {
      if (!grouped[service.branchKey]) {
        grouped[service.branchKey] = {
          name: service.branchName,
          types: {}
        };
      }
      if (!grouped[service.branchKey].types[service.serviceType]) {
        grouped[service.branchKey].types[service.serviceType] = {};
      }
      if (!grouped[service.branchKey].types[service.serviceType][service.category]) {
        grouped[service.branchKey].types[service.serviceType][service.category] = [];
      }
      grouped[service.branchKey].types[service.serviceType][service.category].push(service);
    });

    return grouped;
  }, [filteredServices]);

  const toggleCategory = (key) => {
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Stats
  const totalServices = filteredServices.length;
  const avgPrice = totalServices > 0
    ? filteredServices.reduce((sum, s) => sum + s.price, 0) / totalServices
    : 0;
  const priceRange = totalServices > 0
    ? {
        min: Math.min(...filteredServices.map(s => s.price)),
        max: Math.max(...filteredServices.map(s => s.price))
      }
    : { min: 0, max: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Services Catalog</h3>
          <p className="text-sm text-gray-500">View all available services across branches</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Branches</option>
            {Object.entries(BRANCHES).map(([key, branch]) => (
              <option key={key} value={key}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium">Total Services</p>
          <p className="text-2xl font-bold text-blue-800">{totalServices}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Average Price</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(avgPrice)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-sm text-purple-600 font-medium">Lowest Price</p>
          <p className="text-2xl font-bold text-purple-800">{formatCurrency(priceRange.min)}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <p className="text-sm text-orange-600 font-medium">Highest Price</p>
          <p className="text-2xl font-bold text-orange-800">{formatCurrency(priceRange.max)}</p>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {filteredServices.length} of {allServices.length} services
          </p>
        </div>

        <div className="divide-y">
          {Object.keys(groupedServices).length > 0 ? (
            Object.entries(groupedServices).map(([branchKey, branch]) => (
              <div key={branchKey} className="bg-white">
                {/* Branch Header */}
                <div className="px-6 py-3 bg-gray-100 border-b">
                  <h4 className="font-semibold text-gray-800">{branch.name}</h4>
                </div>

                {Object.entries(branch.types).map(([serviceType, categories]) => (
                  <div key={serviceType} className="border-b last:border-b-0">
                    {/* Service Type Header */}
                    <div className="px-6 py-2 bg-gray-50 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        serviceType === 'Barber' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {serviceType}
                      </span>
                    </div>

                    {Object.entries(categories).map(([category, services]) => {
                      const categoryKey = `${branchKey}-${serviceType}-${category}`;
                      const isExpanded = expandedCategories[categoryKey] !== false; // Default expanded

                      return (
                        <div key={category} className="border-t first:border-t-0">
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(categoryKey)}
                            className="w-full px-6 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="font-medium text-gray-700">{category}</span>
                              <span className="text-xs text-gray-400">({services.length} items)</span>
                            </div>
                          </button>

                          {/* Services */}
                          {isExpanded && (
                            <div className="bg-white">
                              <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-100">
                                  {services.map((service, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-6 py-2 pl-12 text-gray-700">{service.name}</td>
                                      <td className="px-6 py-2 text-right font-medium text-gray-900">
                                        {formatCurrency(service.price)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              No services found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h4 className="font-semibold text-gray-800">Staff Directory</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(BRANCHES).map(([branchKey, branch]) => (
              <div key={branchKey} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">{branch.name}</h5>
                {Object.entries(branch.staff).map(([type, staffList]) => (
                  <div key={type} className="mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      type === 'Barber' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {type}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {staffList.map(name => (
                        <span key={name} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
